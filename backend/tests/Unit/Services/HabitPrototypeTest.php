<?php
namespace Tests\Unit\Services;
use App\Services\Checklist\HabitPrototype;
use App\Models\Habit;
use PHPUnit\Framework\TestCase;
use Mockery;

/** Anggota 4 — Prototype Pattern */
class HabitPrototypeTest extends TestCase
{
    protected function tearDown(): void { Mockery::close(); }

    private function makeHabit(string $title = 'Olahraga'): Habit
    {
        $habit = Mockery::mock(Habit::class);
        $habit->allows('getAttribute')->with('username')->andReturn('testuser');
        $habit->allows('getAttribute')->with('title')->andReturn($title);
        $habit->allows('getAttribute')->with('category')->andReturn('kesehatan');
        $habit->allows('getAttribute')->with('reminder_time')->andReturn('08:00');
        return $habit;
    }

    public function test_clone_tanpa_prototype_throw_runtime_exception(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Prototype habit belum di-set.');
        (new HabitPrototype())->cloneWithNewPeriod('2025-02-01', '2025-02-28');
    }

    public function test_set_prototype_mengembalikan_instance_yang_sama(): void
    {
        $proto = new HabitPrototype();
        $this->assertSame($proto, $proto->setPrototype($this->makeHabit()));
    }

    public function test_prototype_menyimpan_referensi_habit(): void
    {
        $proto = new HabitPrototype();
        $habit = $this->makeHabit('Membaca');
        $proto->setPrototype($habit);
        $ref = new \ReflectionProperty(HabitPrototype::class, 'prototype');
        $ref->setAccessible(true);
        $this->assertSame($habit, $ref->getValue($proto));
    }

    public function test_dua_prototype_instance_menyimpan_habit_berbeda(): void
    {
        $pA = new HabitPrototype(); $hA = $this->makeHabit('Olahraga');
        $pB = new HabitPrototype(); $hB = $this->makeHabit('Meditasi');
        $pA->setPrototype($hA); $pB->setPrototype($hB);
        $ref = new \ReflectionProperty(HabitPrototype::class, 'prototype');
        $ref->setAccessible(true);
        $this->assertNotSame($ref->getValue($pA), $ref->getValue($pB));
    }

    public function test_tanpa_prototype_spread_manual_kehilangan_field(): void
    {
        $original = ['username' => 'user1', 'title' => 'Olahraga', 'category' => 'kesehatan', 'reminder_time' => '08:00'];
        $manual   = ['username' => $original['username'], 'title' => $original['title']]; // lupa reminder_time
        $this->assertArrayNotHasKey('reminder_time', $manual);
        // Dengan Prototype: reminder_time selalu ada
        $proto = new HabitPrototype();
        $proto->setPrototype($this->makeHabit());
        $ref = new \ReflectionProperty(HabitPrototype::class, 'prototype');
        $ref->setAccessible(true);
        $this->assertEquals('08:00', $ref->getValue($proto)->reminder_time);
    }

    public function test_set_prototype_1000_kali_kurang_dari_1_detik(): void
    {
        $proto = new HabitPrototype();
        $habit = $this->makeHabit();
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) $proto->setPrototype($habit);
        $this->assertLessThan(1.0, microtime(true) - $start);
    }
}
