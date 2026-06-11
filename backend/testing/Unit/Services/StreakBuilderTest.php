<?php
namespace Tests\Unit\Services;
use App\Services\Streak\StreakBuilder;
use App\Models\Habit;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;
use Mockery;

/** Anggota 1 — Builder Pattern */
class StreakBuilderTest extends TestCase
{
    protected function tearDown(): void { Mockery::close(); }

    private function makeHabit(string $start = '2025-01-01', string $end = '2025-01-10'): Habit
    {
        $habit = Mockery::mock(Habit::class);
        $habit->allows('getAttribute')->with('periode_start')->andReturn(Carbon::parse($start));
        $habit->allows('getAttribute')->with('periode_end')->andReturn(Carbon::parse($end));
        $habit->allows('getAttribute')->with('reminder_enabled')->andReturn(true);
        $habit->allows('getAttribute')->with('progress_percent')->andReturn(0.0);
        $habit->allows('activityLogs')->andReturnSelf();
        $habit->allows('where')->andReturnSelf();
        $habit->allows('pluck')->andReturn(collect([]));
        $habit->allows('update')->andReturn(true);
        return $habit;
    }

    public function test_build_memiliki_semua_field(): void
    {
        $r = (new StreakBuilder())->build();
        $this->assertArrayHasKey('current_streak', $r);
        $this->assertArrayHasKey('longest_streak', $r);
        $this->assertArrayHasKey('progress_percent', $r);
        $this->assertArrayHasKey('total_period_days', $r);
        $this->assertArrayHasKey('total_completed_days', $r);
    }

    public function test_streak_nol_tanpa_log(): void
    {
        $r = (new StreakBuilder())->build();
        $this->assertEquals(0, $r['current_streak']);
        $this->assertEquals(0, $r['longest_streak']);
    }

    public function test_period_days_10_untuk_10_hari(): void
    {
        $r = (new StreakBuilder())->calculatePeriodDays($this->makeHabit())->build();
        $this->assertEquals(10, $r['total_period_days']);
    }

    public function test_progress_nol_jika_period_days_nol(): void
    {
        $r = (new StreakBuilder())->calculateProgress()->build();
        $this->assertEquals(0.0, $r['progress_percent']);
    }

    public function test_progress_tidak_melebihi_100(): void
    {
        $habit = $this->makeHabit('2025-01-01', '2025-01-05');
        $r = (new StreakBuilder())
            ->calculatePeriodDays($habit)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->build();
        $this->assertLessThanOrEqual(100.0, $r['progress_percent']);
    }

    public function test_method_chaining_mengembalikan_instance_yang_sama(): void
    {
        $habit = $this->makeHabit();
        $b = new StreakBuilder();
        $this->assertSame($b, $b->calculatePeriodDays($habit));
        $this->assertSame($b, $b->calculateCurrentStreak());
        $this->assertSame($b, $b->calculateLongestStreak());
        $this->assertSame($b, $b->calculateProgress());
    }

    public function test_tanpa_builder_kalkulasi_manual_identik(): void
    {
        $manualProgress = min(100.0, round((0 / 10) * 100, 2));
        $habit = $this->makeHabit();
        $r = (new StreakBuilder())
            ->calculatePeriodDays($habit)
            ->calculateCurrentStreak()
            ->calculateLongestStreak()
            ->calculateProgress()
            ->build();
        $this->assertEquals($manualProgress, (float) $r['progress_percent']);
    }

    public function test_dua_instance_builder_terisolasi(): void
    {
        $this->assertNotSame(new StreakBuilder(), new StreakBuilder());
        $this->assertEquals(0, (new StreakBuilder())->build()['current_streak']);
    }

    public function test_build_1000_kali_kurang_dari_1_detik(): void
    {
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) (new StreakBuilder())->build();
        $this->assertLessThan(1.0, microtime(true) - $start);
    }
}
