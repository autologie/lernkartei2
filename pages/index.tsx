import { GetServerSidePropsResult } from "next";

export default function Index() {
  return <></>;
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<{}>
> {
  return {
    redirect: {
      statusCode: 302,
      destination: `/${Math.random().toString().slice(2, 10)}`,
    },
  };
}
