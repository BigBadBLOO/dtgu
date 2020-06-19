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


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE, verbose_name="Группа пользователя")
    university = models.ForeignKey(University, on_delete=models.CASCADE, verbose_name="Университет")

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профиль пользователей'


class Marks(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, verbose_name="Университет")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Критерий оценки'
        verbose_name_plural = 'Критерии оценки'


class ParamsMarks(models.Model):
    name = models.TextField(max_length=500, blank=True, null=True)
    value = models.TextField(max_length=500, blank=True, null=True)
    mark = models.ForeignKey(Marks, on_delete=models.CASCADE, verbose_name="Критерий оценки")
    HighOrderParamMark = models.ForeignKey("self", on_delete=models.CASCADE, verbose_name="Критерий оценки высшего порядка", blank=True,null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Показатель критерия оценки'
        verbose_name_plural = 'Показатели критериев оценки'

