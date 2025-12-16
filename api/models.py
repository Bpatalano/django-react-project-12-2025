from django.db import models

# Create your models here.

class Question(models.Model):
    question = models.TextField()
    type = models.CharField(max_length=50, default='single-choice')
    options = models.JSONField(
        default=dict,
        blank=True,
        help_text='Dictionary of options with keys a, b, c, d, e and text/number values'
    )
    answer = models.JSONField(
        default=list,
        blank=True,
        help_text='List of correct option keys (e.g., ["a"] or ["a", "c"])'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.question[:50]}"
