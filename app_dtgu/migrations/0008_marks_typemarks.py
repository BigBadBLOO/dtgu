# Generated by Django 2.2 on 2020-06-19 22:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app_dtgu', '0007_specialty_code_en'),
    ]

    operations = [
        migrations.AddField(
            model_name='marks',
            name='typeMarks',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='app_dtgu.TypeMarks', verbose_name='Типы оценок'),
            preserve_default=False,
        ),
    ]
