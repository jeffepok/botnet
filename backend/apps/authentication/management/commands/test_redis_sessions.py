from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.contrib.sessions.backends.cache import SessionStore
from django.contrib.auth.models import User
import time


class Command(BaseCommand):
    help = 'Test Redis session configuration and functionality'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing Redis session configuration...'))

        # Test 1: Basic cache connectivity
        try:
            cache.set('test_key', 'test_value', 60)
            value = cache.get('test_key')
            if value == 'test_value':
                self.stdout.write(self.style.SUCCESS('✓ Basic cache connectivity: OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Basic cache connectivity: FAILED'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Basic cache connectivity: FAILED - {e}'))
            return

        # Test 2: Session store functionality
        try:
            session = SessionStore()
            session['test_session_key'] = 'test_session_value'
            session.save()

            # Retrieve the session
            session_id = session.session_key
            new_session = SessionStore(session_key=session_id)
            if new_session.get('test_session_key') == 'test_session_value':
                self.stdout.write(self.style.SUCCESS('✓ Session store functionality: OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Session store functionality: FAILED'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Session store functionality: FAILED - {e}'))
            return

        # Test 3: Session expiration
        try:
            session = SessionStore()
            session['expire_test'] = 'will_expire'
            session.set_expiry(1)  # 1 second
            session.save()

            time.sleep(2)  # Wait for expiration

            session_id = session.session_key
            expired_session = SessionStore(session_key=session_id)
            if expired_session.get('expire_test') is None:
                self.stdout.write(self.style.SUCCESS('✓ Session expiration: OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Session expiration: FAILED'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Session expiration: FAILED - {e}'))

        # Test 4: Cache key prefixes
        try:
            cache_keys = cache.keys('botnet_session*')
            if cache_keys:
                self.stdout.write(self.style.SUCCESS(f'✓ Cache key prefixes: OK (Found {len(cache_keys)} session keys)'))
            else:
                self.stdout.write(self.style.WARNING('⚠ Cache key prefixes: No session keys found (this might be normal)'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Cache key prefixes: FAILED - {e}'))

        # Test 5: Connection pool
        try:
            # Test multiple concurrent operations
            import threading
            results = []

            def test_operation():
                try:
                    cache.set(f'concurrent_test_{threading.get_ident()}', 'value', 10)
                    value = cache.get(f'concurrent_test_{threading.get_ident()}')
                    results.append(value == 'value')
                except Exception:
                    results.append(False)

            threads = [threading.Thread(target=test_operation) for _ in range(5)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join()

            if all(results):
                self.stdout.write(self.style.SUCCESS('✓ Connection pool: OK'))
            else:
                self.stdout.write(self.style.ERROR('✗ Connection pool: FAILED'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Connection pool: FAILED - {e}'))

        self.stdout.write(self.style.SUCCESS('\nRedis session configuration test completed!'))

        # Cleanup
        try:
            cache.delete('test_key')
            self.stdout.write(self.style.SUCCESS('✓ Cleanup completed'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠ Cleanup failed: {e}'))
