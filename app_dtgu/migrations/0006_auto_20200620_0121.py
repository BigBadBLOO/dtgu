# Generated by Django 2.2 on 2020-06-19 22:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_dtgu', '0005_typemarks'),
    ]

    operations = [
        migrations.CreateModel(
            name='Specialty',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True, max_length=500, null=True, verbose_name='Название')),
                ('name_en', models.TextField(blank=True, max_length=500, null=True, verbose_name='Название на англ.')),
                ('code', models.TextField(blank=True, max_length=500, null=True, verbose_name='Код спецальности')),
            ],
            options={
                'verbose_name': 'Специальности',
                'verbose_name_plural': 'Специальности',
            },
        ),
        migrations.AlterField(
            model_name='paramsmarks',
            name='name',
            field=models.TextField(blank=True, max_length=500, null=True, verbose_name='Название'),
        ),
        migrations.AlterField(
            model_name='paramsmarks',
            name='value',
            field=models.TextField(blank=True, max_length=500, null=True, verbose_name='Значение'),
        ),
    ]
