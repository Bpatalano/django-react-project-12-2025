from django.db import models

# Create your models here.

class Question(models.Model):
    question = models.TextField()
    type = models.CharField(max_length=50, default='single-choice')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.question[:50]}"
