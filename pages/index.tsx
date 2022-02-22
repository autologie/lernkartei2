import { GetServerSidePropsResult } from "next";

export default function Index() {
  return <></>;
}

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<{}>
> {
  const newSessionId = Math.random().toString().slice(2, 10);

  return {
    redirect: {
      statusCode: 302,
      destination: `/${newSessionId}`,
    },
  };
}
