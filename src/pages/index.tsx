import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';

import Image from 'next/image';

import * as Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { prismicio } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}



export default function Home({ postsPagination }: HomeProps) {
  const [loadedPosts, setLoadedPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  console.log(postsPagination)

  async function handleLoadMore(): Promise<void> {
    const prismic = prismicio;
    
    const postsResponse = await fetch(nextPage)
    .then(response => response.json())
    .then(data => {
      setNextPage(data.next_page);
      return data.results;
    })
    .catch(err => {
      console.error(err);
    });
    
    const results = postsResponse.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setLoadedPosts([...loadedPosts, ...results]);
  }

  return (
    <>
      <main className={styles.contentContainer}>
        {loadedPosts.map(post => (
          <div key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <h2>{post.data.title}</h2>
            </Link>
            <p>{post.data.subtitle}</p>
            <div>
              <span>
                <FiCalendar />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBR }
                  )}
                </span>
              </span>
              <span>
                <FiUser />
                <span>{post.data.author}</span>
              </span>
            </div>
          </div>
        ))}
        {nextPage && (
          <button type="button" onClick={handleLoadMore}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}


export const getStaticProps: GetStaticProps = async () => {
  const prismic = prismicio;
  const posts = await prismic.getByType('posts', { pageSize: 1 });
  console.log(posts)
  const results = posts.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: posts.next_page,
        results,
      },
    },
    revalidate: 60 * 5,
  };
};