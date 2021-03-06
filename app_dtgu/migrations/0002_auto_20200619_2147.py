# Generated by Django 2.2 on 2020-06-19 18:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app_dtgu', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paramsmarks',
            name='HighOrderParamMark',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app_dtgu.ParamsMarks', verbose_name='Критерий оценки высшего порядка'),
        ),
        migrations.AlterField(
            model_name='university',
            name='name',
            field=models.CharField(blank=True, max_length=200, null=True, verbose_name='Наименование университета'),
        ),
    ]
