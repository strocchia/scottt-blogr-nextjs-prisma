import React, { useState, useEffect } from "react";
// import { GetStaticProps } from "next";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import ReactMarkdown from "react-markdown";
import Post, { PostProps } from "../components/Post";
import Router from "next/router";

import prisma from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const editpost = await prisma.post.findUnique({
    where: { id: Number(context.query.p) },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return {
    props: {
      postToEdit: JSON.parse(JSON.stringify(editpost)),
    },
  };
};

type Props = {
  postToEdit: PostProps;
};

const EditPost: React.FC<Props> = ({ postToEdit }) => {
  const [title, setTitle] = useState(postToEdit.title);
  const [content, setContent] = useState(postToEdit.content);

  const onEditData = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const body = {
      title: title,
      content: content,
    };

    await fetch(`../api/update/${postToEdit.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    await Router.push("/");
  };

  return (
    <Layout>
      <div>
        <form onSubmit={onEditData}>
          <h1>Edit me</h1>
          <input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />
          <textarea
            cols={50}
            rows={10}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            value={content}
          />
          <input disabled={!content || !title} type="submit" value="Update" />
          <a className="back" href="#" onClick={() => Router.push("/")}>
            or Cancel
          </a>
        </form>
        <ReactMarkdown source={content} />
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type="submit"] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default EditPost;
