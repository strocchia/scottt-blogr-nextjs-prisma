import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import Router from "next/router";
import { PostProps } from "../../components/Post";
import { useSession } from "next-auth/client";
import prisma from "../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return {
    props: JSON.parse(JSON.stringify(post)),
  };
};

async function publishPost(id: number, pub: boolean): Promise<void> {
  await fetch(`../api/publish/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pub: pub }),
  });

  await Router.push("/");
}

async function deletePost(id: number): Promise<void> {
  await fetch(`../api/post/${id}`, {
    method: "DELETE",
  });

  Router.push("/");
}

const Post: React.FC<PostProps> = (props) => {
  const [session, loading] = useSession();
  if (loading) {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  if (!props.published) {
    title = `${title}`;
  }

  console.log(props);

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p id="statusLabel">
          {!props.published ? (
            <em>( {"Draft".toUpperCase()} )</em>
          ) : (
            <>{"Pub".toUpperCase()}</>
          )}
        </p>
        <br />
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown source={props.content} />
        {userHasValidSession && postBelongsToUser && (
          // <button onClick={() => editPost(props.id)}>Edit</button>
          <Link href="../edit?p=[id]" as={`../edit?p=${props.id}`}>
            <button>
              <a>Edit</a>
            </button>
          </Link>
        )}
        {!props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id, props.published)}>
            Publish
          </button>
        )}
        {props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id, props.published)}>
            Set as Draft
          </button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(props.id)}>Delete</button>
        )}
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        #statusLabel {
          margin-top: -0.7rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Post;
