import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export default function Index() {
  return <></>;
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  const sessionId =
    ctx.req.cookies.sessionId ?? Math.random().toString().slice(2, 10);

  return {
    redirect: {
      statusCode: 302,
      destination: `/${sessionId}`,
    },
  };
}
