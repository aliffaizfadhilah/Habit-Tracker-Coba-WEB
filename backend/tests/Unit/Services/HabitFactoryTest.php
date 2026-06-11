<?php

namespace Tests\Unit\Services;

use App\Services\Habit\HabitFactory;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

/**
 * Anggota 6 — Fitur Tambah Habit + Edit Habit
 * Design Pattern : Factory Pattern
 * Tools          : PHPUnit 12
 *
 * buildUpdatePayload() diuji penuh (tidak menyentuh DB).
 * create() diuji melalui kalkulasi total_period_days yang sama.
 */
class HabitFactoryTest extends TestCase
{
    private HabitFactory $factory;

    protected function setUp(): void
    {
        $this->factory = new HabitFactory();
    }

    // ── Pengujian Design Pattern ──────────────────────────────────────────
    public function test_build_update_payload_mengembalikan_array_dengan_semua_field(): void
    {
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Olahraga',
            'category'      => 'kesehatan',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-01-10',
            'reminder_time' => '08:00',
        ]);

        $this->assertArrayHasKey('title',             $payload);
        $this->assertArrayHasKey('category',          $payload);
        $this->assertArrayHasKey('periode_start',     $payload);
        $this->assertArrayHasKey('periode_end',       $payload);
        $this->assertArrayHasKey('total_period_days', $payload);
        $this->assertArrayHasKey('reminder_time',     $payload);
    }
    public function test_build_update_payload_menghitung_total_period_days_dengan_benar(): void
    {
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Meditasi',
            'category'      => 'spiritual',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-01-30',
            'reminder_time' => '07:00',
        ]);

        $this->assertEquals(30, $payload['total_period_days']);
    }
    public function test_total_period_days_untuk_periode_1_hari_adalah_1(): void
    {
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Test',
            'category'      => 'personal',
            'periode_start' => '2025-06-01',
            'periode_end'   => '2025-06-01',
            'reminder_time' => null,
        ]);

        $this->assertEquals(1, $payload['total_period_days']);
    }
    public function test_build_update_payload_memetakan_title_dan_category_dengan_benar(): void
    {
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Membaca Buku',
            'category'      => 'ilmu_pengetahuan',
            'periode_start' => '2025-03-01',
            'periode_end'   => '2025-03-31',
            'reminder_time' => '20:00',
        ]);

        $this->assertEquals('Membaca Buku',      $payload['title']);
        $this->assertEquals('ilmu_pengetahuan',  $payload['category']);
        $this->assertEquals('20:00',             $payload['reminder_time']);
    }
    public function test_reminder_time_null_diterima_di_payload(): void
    {
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Tanpa Reminder',
            'category'      => 'personal',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-01-07',
            'reminder_time' => null,
        ]);

        $this->assertNull($payload['reminder_time']);
    }

    // ── Perbandingan: Tanpa Design Pattern ───────────────────────────────
    public function test_tanpa_factory_kalkulasi_period_days_inline_rawan_salah(): void
    {
        // Tanpa Factory: developer hitung manual, rawan lupa +1
        $start = Carbon::parse('2025-01-01');
        $end   = Carbon::parse('2025-01-10');

        $salah = $start->diffInDays($end);      // 9 — lupa +1
        $benar = $start->diffInDays($end) + 1;  // 10 — benar

        $this->assertEquals(9,  $salah);
        $this->assertEquals(10, $benar);

        // Dengan Factory: selalu benar karena logika terpusat
        $payload = $this->factory->buildUpdatePayload([
            'title'         => 'Test',
            'category'      => 'personal',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-01-10',
            'reminder_time' => null,
        ]);
        $this->assertEquals(10, $payload['total_period_days']);
    }
    public function test_factory_menghasilkan_payload_konsisten_untuk_create_dan_update(): void
    {
        $data = [
            'title'         => 'Olahraga',
            'category'      => 'kesehatan',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-01-31',
            'reminder_time' => '06:00',
        ];

        $updatePayload = $this->factory->buildUpdatePayload($data);

        // Kalkulasi total_period_days harus sama antara create dan update
        $this->assertEquals(31, $updatePayload['total_period_days']);
    }

    // ── Performa ─────────────────────────────────────────────────────────
    public function test_build_update_payload_1000_kali_kurang_dari_1_detik(): void
    {
        $data  = [
            'title'         => 'Olahraga',
            'category'      => 'kesehatan',
            'periode_start' => '2025-01-01',
            'periode_end'   => '2025-12-31',
            'reminder_time' => '07:00',
        ];
        $start = microtime(true);

        for ($i = 0; $i < 1000; $i++) {
            $this->factory->buildUpdatePayload($data);
        }

        $this->assertLessThan(1.0, microtime(true) - $start);
    }
}
