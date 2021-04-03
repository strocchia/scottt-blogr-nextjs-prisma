import prisma from "../../../lib/prisma";

// PUT /api/update/:id
export default async function handle(req, res) {
  const postId = req.query.id;
  const updatedPost = await prisma.post.update({
    where: { id: Number(postId) },
    data: {
      title: req.body.title,
      content: req.body.content,
    },
  });

  res.json(updatedPost);
}
