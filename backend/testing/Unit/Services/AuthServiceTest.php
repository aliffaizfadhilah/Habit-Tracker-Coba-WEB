<?php
namespace Tests\Unit\Services;
use App\Services\Auth\AuthService;
use App\Services\Auth\OtpService;
use App\Repositories\Contracts\UserRepositoryInterface;
use PHPUnit\Framework\TestCase;
use Mockery;

/** Anggota 5 — Singleton Pattern */
class AuthServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        $ref = new \ReflectionProperty(OtpService::class, 'instance');
        $ref->setAccessible(true);
        $ref->setValue(null, null);
        Mockery::close();
    }

    public function test_otp_singleton_mengembalikan_instance_yang_sama(): void
    {
        $this->assertSame(OtpService::getInstance(), OtpService::getInstance());
    }

    public function test_otp_konstruktor_bersifat_private(): void
    {
        $ref = new \ReflectionClass(OtpService::class);
        $this->assertTrue($ref->getConstructor()->isPrivate());
    }

    public function test_send_forgot_otp_null_jika_email_tidak_ditemukan(): void
    {
        $repo = Mockery::mock(UserRepositoryInterface::class);
        $repo->shouldReceive('findByEmail')->with('notfound@example.com')->andReturn(null);
        $result = (new AuthService($repo, OtpService::getInstance()))->sendForgotOtp('notfound@example.com');
        $this->assertNull($result);
    }

    public function test_verify_forgot_otp_null_jika_user_tidak_ada(): void
    {
        $repo = Mockery::mock(UserRepositoryInterface::class);
        $repo->shouldReceive('findByEmail')->andReturn(null);
        $result = (new AuthService($repo, OtpService::getInstance()))->verifyForgotOtp('notfound@example.com', '123456');
        $this->assertNull($result);
    }

    public function test_reset_password_false_jika_user_tidak_ada(): void
    {
        $repo = Mockery::mock(UserRepositoryInterface::class);
        $repo->shouldReceive('findByEmail')->andReturn(null);
        $result = (new AuthService($repo, OtpService::getInstance()))->resetPassword('notfound@example.com', '000000', 'newpass');
        $this->assertFalse($result);
    }

    public function test_tanpa_singleton_dua_instance_otp_berbeda(): void
    {
        $ref = new \ReflectionProperty(OtpService::class, 'instance');
        $ref->setAccessible(true);
        $ref->setValue(null, null); $s1 = OtpService::getInstance();
        $ref->setValue(null, null); $s2 = OtpService::getInstance();
        $this->assertNotSame($s1, $s2);
        // Reset ke Singleton yang benar
        $ref->setValue(null, $s2);
        $this->assertSame($s2, OtpService::getInstance());
    }

    public function test_otp_get_instance_1000_kali_selalu_sama(): void
    {
        $first = OtpService::getInstance();
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) $this->assertSame($first, OtpService::getInstance());
        $this->assertLessThan(0.5, microtime(true) - $start);
    }

    public function test_auth_service_konstruksi_1000_kali_cepat(): void
    {
        $repo  = Mockery::mock(UserRepositoryInterface::class);
        $otp   = OtpService::getInstance();
        $start = microtime(true);
        for ($i = 0; $i < 1000; $i++) new AuthService($repo, $otp);
        $this->assertLessThan(1.0, microtime(true) - $start);
    }
}
