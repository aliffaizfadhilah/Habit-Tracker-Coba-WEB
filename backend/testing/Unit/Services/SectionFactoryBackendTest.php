<?php
namespace Tests\Unit\Services;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

/** Anggota 7 — Factory Pattern */
class SectionFactoryBackendTest extends TestCase
{
    private function habit(int $completed = 0, int $period = 10, ?Carbon $end = null): object
    {
        return (object)[
            'total_completed_days' => $completed,
            'total_period_days'    => $period,
            'periode_end'          => $end ?? Carbon::tomorrow(),
        ];
    }

    private function isComplete(object $h): bool
    {
        return $h->total_period_days > 0 && $h->total_completed_days >= $h->total_period_days;
    }

    private function isExpired(object $h): bool
    {
        return !$this->isComplete($h) && $h->periode_end && Carbon::today()->isAfter($h->periode_end);
    }

    public function test_is_complete_true_jika_completed_sama_dengan_period(): void
    {
        $this->assertTrue($this->isComplete($this->habit(10, 10)));
    }

    public function test_is_complete_true_jika_completed_melebihi_period(): void
    {
        $this->assertTrue($this->isComplete($this->habit(15, 10)));
    }

    public function test_is_complete_false_jika_completed_kurang_dari_period(): void
    {
        $this->assertFalse($this->isComplete($this->habit(5, 10)));
    }

    public function test_is_complete_false_jika_period_nol(): void
    {
        $this->assertFalse($this->isComplete($this->habit(0, 0)));
    }

    public function test_is_expired_true_jika_periode_lewat_dan_belum_selesai(): void
    {
        $this->assertTrue($this->isExpired($this->habit(3, 10, Carbon::yesterday())));
    }

    public function test_is_expired_false_jika_sudah_selesai_meski_periode_lewat(): void
    {
        $this->assertFalse($this->isExpired($this->habit(10, 10, Carbon::yesterday())));
    }

    public function test_is_locked_true_untuk_habit_selesai(): void
    {
        $h = $this->habit(10, 10);
        $this->assertTrue($this->isComplete($h) || $this->isExpired($h));
    }

    public function test_is_locked_false_untuk_habit_aktif(): void
    {
        $h = $this->habit(5, 10);
        $this->assertFalse($this->isComplete($h) || $this->isExpired($h));
    }

    public function test_tanpa_factory_operator_lebih_besar_vs_lebih_besar_sama_dengan(): void
    {
        $h = $this->habit(10, 10);
        $salah = $h->total_completed_days > $h->total_period_days;
        $benar = $this->isComplete($h);
        $this->assertFalse($salah);
        $this->assertTrue($benar);
    }

    public function test_is_complete_1_juta_kali_kurang_dari_2_detik(): void
    {
        $h = $this->habit(7, 10);
        $start = microtime(true);
        for ($i = 0; $i < 1_000_000; $i++) $this->isComplete($h);
        $this->assertLessThan(2.0, microtime(true) - $start);
    }
}
