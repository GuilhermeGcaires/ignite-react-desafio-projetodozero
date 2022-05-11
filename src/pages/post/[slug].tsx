import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { prismicio } from '../../services/prismic';
import * as Prismic from '@prismicio/client'


import Head from 'next/head';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiClock, FiUser } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {
  return (
    <article className={styles.container}>
      <img src={post.data.banner.url} alt={post.data.title} />
      <h1>{post.data.title}</h1>
      <div className={styles.info}>
        <div>
          <span>
            <AiOutlineCalendar />
            <span>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
          </span>
          <span>
            <FiUser />
            <span>{post.data.author}</span>
          </span>
          <span>
            <FiClock />
            <span>{} min</span>
          </span>
        </div>
      </div>
      <div className={styles.content}>
        {post.data.content.map(content => (
          <div key={(Math.random() * 9999999).toString()}>
            <h2>{content.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {

  return {
    paths: [],
    fallback: false,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = prismicio;

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  return {
    props: {
      post
    },
    revalidate: 60 * 30,
  }
}

