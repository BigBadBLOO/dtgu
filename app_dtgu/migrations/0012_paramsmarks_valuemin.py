# Generated by Django 2.2 on 2020-06-20 18:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_dtgu', '0011_paramsmarks_is_good'),
    ]

    operations = [
        migrations.AddField(
            model_name='paramsmarks',
            name='valueMin',
            field=models.TextField(blank=True, max_length=500, null=True, verbose_name='Пороговое значение'),
        ),
    ]