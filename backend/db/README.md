# Database Notes

## Apply schema

Run the SQL in `migrations/001_init.sql` against your MySQL database first.

## Load demo content

After the schema exists, run `seeds/001_demo_content.sql`.

This seed file gives you:

- 1 demo student account
- 3 published subjects
- ordered sections and videos

## Demo login

- Email: `student@ked.dev`
- Password: `Password123!`

The password hash was generated with `bcryptjs` and is ready to use with the backend auth module.

