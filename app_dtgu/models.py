from django.contrib.auth.models import User
from django.db import models


class UserGroup(models.Model):
    name = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Группа пользователей'
        verbose_name_plural = 'Группы пользователей'


class University(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True, verbose_name='Наименование университета')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Университет'
        verbose_name_plural = 'Университет'


class Specialty(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True, verbose_name="Название")
    name_en = models.TextField(max_length=500, blank=True, null=True, verbose_name="Название на англ.")
    code = models.TextField(max_length=500, blank=True, null=True, verbose_name="Код спецальности")
    code_en = models.TextField(max_length=500, blank=True, null=True, verbose_name="Код спецальности на англ.")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Специальности'
        verbose_name_plural = 'Специальности'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE, verbose_name="Группа пользователя")
    university = models.ForeignKey(University, on_delete=models.CASCADE, verbose_name="Университет")
    specialty = models.ForeignKey(Specialty, models.SET_NULL, blank=True, null=True, verbose_name='Специальность')

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профиль пользователей'


class TypeMarks(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Название")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Типы оценок'
        verbose_name_plural = 'Типы оценок'


class Marks(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, verbose_name="Университет")
    typeMarks = models.ForeignKey(TypeMarks, on_delete=models.CASCADE, verbose_name="Типы оценок")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Критерий оценки'
        verbose_name_plural = 'Критерии оценки'


class ParamsMarks(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True, verbose_name="Название")
    value = models.TextField(max_length=500, blank=True, null=True, verbose_name="Значение")
    mark = models.ForeignKey(Marks, on_delete=models.CASCADE, verbose_name="Критерий оценки", blank=True, null=True)
    HighOrderParamMark = models.ForeignKey("self", on_delete=models.CASCADE, verbose_name="Критерий оценки высшего порядка", blank=True,null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Показатель критерия оценки'
        verbose_name_plural = 'Показатели критериев оценки'


class Subject(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True, verbose_name="Название")
    speciality = models.ForeignKey(Specialty, on_delete=models.CASCADE, verbose_name="Специальность")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Учебные предметы'
        verbose_name_plural = 'Учебные предметы'




