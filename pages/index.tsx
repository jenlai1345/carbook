import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false, // 302
    },
  };
};

export default function Home() {
  return null; // 不會被渲染，因為已在伺服器端轉址
}
