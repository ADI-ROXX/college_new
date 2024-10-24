// pages/index.js
export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: '/events',
      permanent: false, // Set to true if you want a permanent redirect (301)
    },
  };
};

const HomePage = () => {
  return null; // This page won't be rendered as the redirect happens
};

export default HomePage;