# Generated by Django 3.0.5 on 2020-04-25 14:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='user',
        ),
        migrations.AddField(
            model_name='user',
            name='profiles',
            field=models.ManyToManyField(to='product.UserProfile'),
        ),
    ]
