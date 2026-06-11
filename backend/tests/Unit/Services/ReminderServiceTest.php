<?php
namespace Tests\Unit\Services;
use App\Services\Reminder\ReminderService;
use App\Repositories\Contracts\ReminderRepositoryInterface;
use App\Models\Habit;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;
use Mockery;

/** Anggota 3 — Singleton Pattern */
class ReminderServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        $ref = new \ReflectionProperty(ReminderService::class, 'instance');
        $ref->setAccessible(true);
        $ref->setValue(null, null);
        Mockery::close();
    }

    private function makeRepo(): ReminderRepositoryInterface
    {
        return Mockery::mock(ReminderRepositoryInterface::class);
    }

    private function makeHabit(bool $enabled = true, float $progress = 50.0, ?Carbon $end = null): Habit
    {
        $habit = Mockery::mock(Habit::class);
        $habit->allows('getAttribute')->with('reminder_enabled')->andReturn($enabled);
        $habit->allows('getAttribute')->with('progress_percent')->andReturn($progress);
        $habit->allows('getAttribute')->with('periode_end')->andReturn($end ?? Carbon::tomorrow());
        return $habit;
    }

    public function test_get_instance_mengembalikan_instance_yang_sama(): void
    {
        $repo = $this->makeRepo();
        $this->assertSame(ReminderService::getInstance($repo), ReminderService::getInstance($repo));
    }

    public function test_get_due_habits_memanggil_repo_dengan_waktu_benar(): void
    {
        $repo = $this->makeRepo();
        $repo->shouldReceive('findHabitsWithReminder')->once()->with('08:00')->andReturn(collect([]));
        $this->assertTrue(ReminderService::getInstance($repo)->getDueHabits('08:00')->isEmpty());
    }

    public function test_update_mendelegasikan_ke_repo(): void
    {
        $habit = $this->makeHabit();
        $repo  = $this->makeRepo();
        $repo->shouldReceive('updateReminder')->once()->with($habit, ['reminder_time' => '09:00'])->andReturn($habit);
        $result = ReminderService::getInstance($repo)->update($habit, ['reminder_time' => '09:00']);
        $this->assertSame($habit, $result);
    }

    public function test_disable_if_completed_menonaktifkan_jika_progress_100(): void
    {
        $habit = $this->makeHabit(true, 100.0);
        $repo  = $this->makeRepo();
        $repo->shouldReceive('updateReminder')->once()->with($habit, ['reminder_enabled' => false])->andReturn($habit);
        ReminderService::getInstance($repo)->disableIfCompleted($habit);
        $this->assertTrue(true);
    }

    public function test_disable_if_completed_menonaktifkan_jika_periode_berakhir(): void
    {
        $habit = $this->makeHabit(true, 50.0, Carbon::yesterday());
        $repo  = $this->makeRepo();
        $repo->shouldReceive('updateReminder')->once()->with($habit, ['reminder_enabled' => false])->andReturn($habit);
        ReminderService::getInstance($repo)->disableIfCompleted($habit);
        $this->assertTrue(true);
    }

    public function test_disable_if_completed_tidak_memanggil_repo_jika_masih_aktif(): void
    {
        $habit = $this->makeHabit(true, 50.0, Carbon::tomorrow());
        $repo  = $this->makeRepo();
        $repo->shouldReceive('updateReminder')->never();
        ReminderService::getInstance($repo)->disableIfCompleted($habit);
        $this->assertTrue(true);
    }

    public function test_tanpa_singleton_dua_instance_berbeda(): void
    {
        $ref = new \ReflectionProperty(ReminderService::class, 'instance');
        $ref->setAccessible(true);
        $repo = $this->makeRepo();
        $ref->setValue(null, null); $s1 = ReminderService::getInstance($repo);
        $ref->setValue(null, null); $s2 = ReminderService::getInstance($repo);
        $this->assertNotSame($s1, $s2);
    }

    public function test_get_instance_1000_kali_selalu_sama_dan_cepat(): void
    {
        $repo  = $this->makeRepo();
        $first = ReminderService::getInstance($repo);
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) $this->assertSame($first, ReminderService::getInstance($repo));
        $this->assertLessThan(0.5, microtime(true) - $start);
    }
}
