# Generated by Django 2.2 on 2020-06-19 23:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app_dtgu', '0008_marks_typemarks'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='specialty',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='app_dtgu.Specialty', verbose_name='Специальность'),
        ),
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(blank=True, max_length=500, null=True, verbose_name='Название')),
                ('speciality', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app_dtgu.Specialty', verbose_name='Специальность')),
            ],
            options={
                'verbose_name': 'Учебные предметы',
                'verbose_name_plural': 'Учебные предметы',
            },
        ),
    ]
