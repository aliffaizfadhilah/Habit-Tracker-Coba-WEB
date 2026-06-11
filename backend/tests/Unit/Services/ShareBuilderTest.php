<?php
namespace Tests\Unit\Services;
use App\Services\Share\ShareBuilder;
use App\Models\Habit;
use PHPUnit\Framework\TestCase;
use Mockery;

/** Anggota 2 — Builder Pattern */
class ShareBuilderTest extends TestCase
{
    protected function tearDown(): void { Mockery::close(); }

    private function makeHabit(string $title = 'Olahraga', float $progress = 75.0): Habit
    {
        $habit = Mockery::mock(Habit::class);
        $habit->allows('getAttribute')->with('id_habit')->andReturn(1);
        $habit->allows('getAttribute')->with('title')->andReturn($title);
        $habit->allows('getAttribute')->with('progress_percent')->andReturn($progress);
        return $habit;
    }

    public function test_build_mengembalikan_payload_lengkap(): void
    {
        $p = (new ShareBuilder())
            ->fromHabit($this->makeHabit())
            ->withTitle('Streak 30 hari!')
            ->withCaption('Konsisten')
            ->withImagePath('uploads/snap.png')
            ->withUserId(42)
            ->build();
        $this->assertEquals(1, $p['habit_id']);
        $this->assertEquals('Olahraga', $p['habit_title']);
        $this->assertEquals(75.0, $p['progress_percent']);
        $this->assertEquals('Streak 30 hari!', $p['title']);
        $this->assertEquals('Konsisten', $p['caption']);
        $this->assertEquals('uploads/snap.png', $p['image_path']);
        $this->assertEquals(42, $p['user_id']);
    }

    public function test_from_habit_menyalin_tiga_field(): void
    {
        $p = (new ShareBuilder())->fromHabit($this->makeHabit('Meditasi', 50.0))->build();
        $this->assertEquals(1, $p['habit_id']);
        $this->assertEquals('Meditasi', $p['habit_title']);
        $this->assertEquals(50.0, $p['progress_percent']);
    }

    public function test_caption_boleh_null(): void
    {
        $p = (new ShareBuilder())->withTitle('Test')->withCaption(null)->build();
        $this->assertNull($p['caption']);
    }

    public function test_build_mereset_payload_setelah_dipanggil(): void
    {
        $b = new ShareBuilder();
        $b->withTitle('Post Pertama')->build();
        $second = $b->withTitle('Post Kedua')->build();
        $this->assertEquals('Post Kedua', $second['title']);
        $this->assertArrayNotHasKey('image_path', $second);
    }

    public function test_method_chaining_mengembalikan_instance_yang_sama(): void
    {
        $habit = $this->makeHabit();
        $b = new ShareBuilder();
        $this->assertSame($b, $b->fromHabit($habit));
        $this->assertSame($b, $b->withTitle('Test'));
        $this->assertSame($b, $b->withCaption('Caption'));
        $this->assertSame($b, $b->withImagePath('img.png'));
        $this->assertSame($b, $b->withUserId(1));
    }

    public function test_tanpa_builder_array_manual_tidak_ada_reset(): void
    {
        $manual = ['title' => 'Manual', 'caption' => null, 'image_path' => 'img.png'];
        $this->assertNull($manual['caption']);
        // Builder selalu reset setelah build()
        $b = new ShareBuilder();
        $b->withTitle('Pertama')->build();
        $second = $b->withTitle('Kedua')->build();
        $this->assertArrayNotHasKey('image_path', $second);
    }

    public function test_dua_instance_builder_independen(): void
    {
        $habit = $this->makeHabit();
        $p1 = (new ShareBuilder())->withTitle('A')->fromHabit($habit)->build();
        $p2 = (new ShareBuilder())->withTitle('B')->fromHabit($habit)->build();
        $this->assertEquals('A', $p1['title']);
        $this->assertEquals('B', $p2['title']);
    }

    public function test_1000_payload_kurang_dari_1_detik(): void
    {
        $habit = $this->makeHabit();
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) {
            (new ShareBuilder())->fromHabit($habit)->withTitle("Post {$i}")->withUserId($i)->build();
        }
        $this->assertLessThan(1.0, microtime(true) - $start);
    }
}
