<?php

namespace App\Repositories\Contracts;

use App\Models\Post;
use App\Models\PostComment;
use Illuminate\Support\Collection;

interface PostRepositoryInterface
{
    public function allWithUsers(): Collection;
    public function findById(int $id): ?Post;
    public function findByIdAndUser(int $id, int $userId): ?Post;
    public function create(array $data): Post;
    public function delete(Post $post): void;
    public function toggleLike(int $postId, int $userId): array;
    public function getComments(int $postId): Collection;
    public function createComment(array $data): PostComment;
    public function findComment(int $commentId, int $postId, int $userId): ?PostComment;
    public function deleteComment(PostComment $comment): void;
}
