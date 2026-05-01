from django.db import models
from django.contrib.auth.models import User

class DailyEntry(models.Model):
    user          = models.ForeignKey(User, on_delete=models.CASCADE)
    date          = models.DateField()
    hours_coded   = models.DecimalField(max_digits=4, decimal_palces=1)
    applications_sent + models.InetegerField(default=0)
    notes             = models.TextField(blank=True)
    created_at        = models.DateField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date']

    def __str__(self):
       return f"{self.user.username} — {self.date}"