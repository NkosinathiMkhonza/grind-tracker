from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import DailyEntry


class EntryApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tester', password='secret123')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_repeated_submission_for_same_date_updates_existing_entry(self):
        first_payload = {
            'date': '2026-08-08',
            'hours_coded': '2.5',
            'applications_sent': 3,
            'notes': 'first pass',
        }

        first_response = self.client.post('/api/entries/', first_payload, format='json')
        self.assertEqual(first_response.status_code, 201)

        second_payload = {
            'date': '2026-08-08',
            'hours_coded': '4.0',
            'applications_sent': 5,
            'notes': 'updated pass',
        }

        second_response = self.client.post('/api/entries/', second_payload, format='json')

        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(DailyEntry.objects.filter(user=self.user).count(), 1)

        entry = DailyEntry.objects.get(user=self.user, date='2026-08-08')
        self.assertEqual(entry.hours_coded, Decimal('4.0'))
        self.assertEqual(entry.applications_sent, 5)
        self.assertEqual(entry.notes, 'updated pass')

    def test_entries_require_authentication(self):
        self.client.credentials()

        response = self.client.get('/api/entries/')

        self.assertEqual(response.status_code, 401)

    def test_hours_must_be_between_zero_and_twenty_four(self):
        response = self.client.post('/api/entries/', {
            'date': '2026-08-09',
            'hours_coded': '24.1',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('hours_coded', response.data)

    def test_user_cannot_read_another_users_entry(self):
        other_user = User.objects.create_user(username='other', password='secret123')
        entry = DailyEntry.objects.create(
            user=other_user,
            date='2026-08-10',
            hours_coded=2,
        )

        response = self.client.get(f'/api/entries/{entry.id}/')

        self.assertEqual(response.status_code, 404)

    def test_stats_sum_entries_and_calculate_current_streak(self):
        today = date.today()
        DailyEntry.objects.create(user=self.user, date=today, hours_coded=2.5, applications_sent=2)
        DailyEntry.objects.create(user=self.user, date=today - timedelta(days=1), hours_coded=1.5, applications_sent=1)

        response = self.client.get('/api/stats/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_hours'], Decimal('4'))
        self.assertEqual(response.data['total_applications'], 3)
        self.assertEqual(response.data['streak'], 2)

    def test_register_creates_user_and_token(self):
        response = self.client.post('/api/register/', {
            'username': 'new-user',
            'password': 'strong-password',
            'email': 'new@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['username'], 'new-user')
        self.assertTrue(response.data['token'])
        self.assertTrue(User.objects.filter(username='new-user').exists())

    def test_register_rejects_duplicate_username(self):
        response = self.client.post('/api/register/', {
            'username': self.user.username,
            'password': 'another-password',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('already taken', response.data['error'])

    def test_logout_deletes_auth_token(self):
        response = self.client.post('/api/logout/')

        self.assertEqual(response.status_code, 200)
        self.assertFalse(Token.objects.filter(user=self.user).exists())
