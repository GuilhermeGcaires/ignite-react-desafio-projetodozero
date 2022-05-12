import { GetStaticPaths, GetStaticProps } from 'next';

import { useRouter } from 'next/router';

import Head from 'next/head';

import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';

import styles from './post.module.scss';

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

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) {
    return (
      <div className={styles.fallBackPageContainer}>
        <h1 className={styles.fallBackPageText}>Carregando...</h1>
      </div>
    );
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((total, content) => {
    let sum = total;

    sum += content.heading.split(' ').length;

    const words = content.body.map(body => body.text.split(' ').length);

    words.map(word => (sum += word));

    return sum;
  }, 0);

  const estimatedTime = Math.ceil(totalWords / 200);
  console.log(post.data.banner)

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>

      <section className={commonStyles.container}>
        <div className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInner}>
            <div className={styles.createdAt}>
              <FiCalendar/>
              <time>{formattedDate}</time>
            </div>

            <div className={styles.author}>
              <FiUser/>
              <span>{post.data.author}</span>
            </div>

            <div className={styles.estimatedTime}>
              <FiClock/>
              <span>{estimatedTime} min</span>
            </div>
          </div>

          <div className={styles.contentContainer}>
            {post.data.content.map(content => {
              return (
                <div key={content.heading} className={styles.content}>
                  <h2>{content.heading}</h2>

                  {content.body.map(body => {
                    return <p key={body.text}>{body.text}</p>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.getByType('posts', { fetch: ['posts.uid']})

  // console.log(posts)

  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  console.log(response)

  const contents = response.data.content.map(content => {
    const bodys = content.body.map(body => {
      return body;
    });
  
    return {
      heading: content.heading,
      body: bodys,
    };
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: contents,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};