from django.urls import path
from .views import EntryListCreateView, EntryDetailView, DashboardStatsView

urlpatterns = [
    path('entries/',         EntryListCreateView.as_view(), name='entry-list'),
    path('entries/<int:pk>/',EntryDetailView.as_view(),     name='entry-detail'),
    path('stats/',           DashboardStatsView.as_view(),  name='dashboard-stats'),
]