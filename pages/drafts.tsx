import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import { useSession, getSession } from "next-auth/client";
import prisma from "../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return {
      props: {
        drafts: [],
      },
    };
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return {
    props: { drafts: JSON.parse(JSON.stringify(drafts)) },
  };
};

type Props = {
  drafts: PostProps[];
};

const Drafts: React.FC<Props> = ({ drafts }) => {
  const [session] = useSession();

  if (!session) {
    return (
      <Layout>
        <h1>
          <em>??</em> Drafts
        </h1>
        <div>Validation needed ... nothing to show.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <h1>My Drafts</h1>
        <main>
          {drafts.map((post) => (
            <div key={post.id} className="post">
              <Post post={post} />
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .page {
          margin-bottom: 5rem;
        }

        .post {
          background: white;
          transition: box-shadow 0.3s ease-in;
        }

        .post:hover {
          box-shadow: 5px 5px 5px #888;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default Drafts;
