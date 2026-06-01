# ZIP Shofi — Fitur 13 (Share Progress) + Fitur 14 (Upload & Post Wall)

## File yang menjadi tanggung jawab Shofi

### Backend
- `app/Http/Controllers/PostController.php`
- `app/Http/Controllers/FeedEventController.php`
- `app/Services/Post/PostService.php`
- `app/Services/Share/ShareBuilder.php`
- `app/Models/Post.php`, `PostLike.php`, `PostComment.php`
- `app/Http/Requests/PostRequest.php`, `CommentRequest.php`
- `database/migrations/2026_05_15_100001_create_posts_table.php`
- `database/migrations/2026_05_15_100002_create_post_likes_table.php`
- `database/migrations/2026_05_15_100003_create_post_comments_table.php`
- `database/migrations/2026_05_18_000001_add_is_private_to_posts_table.php`
- `database/migrations/2026_05_18_000002_add_frame_style_to_posts_table.php`

### Frontend
- `src/Presentasion/pages/PostinganPage.tsx`
- `src/Presentasion/components/PostFormModal.tsx`
- `src/Presentasion/components/NewPostModal.tsx`
- `src/Presentasion/components/SnapshotEditor.tsx`
- `src/BusinessLogic/builders/SnapshotBuilder.ts`
- `src/BusinessLogic/builders/PostBuilder.ts`
- `src/BusinessLogic/hooks/useFeedRealtime.ts`
- `src/BusinessLogic/services/PostService.ts`

## Cara menjalankan
```bash
cp backend/.env.example backend/.env
docker compose up --build
docker compose exec php php artisan migrate --seed
# Buka: http://localhost:5173/postingan
```

## Akun test
| Email | Password |
|-------|----------|
| shofi@example.com | password123 |
| testuser@example.com | password123 |
| user2@example.com | password123 |

## Branch GitHub
`feature/shofi-share-post`

## Koordinator
Hubungi **Alip** untuk pertanyaan seputar merge conflict.
