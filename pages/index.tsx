import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export default function Index() {
  return <></>;
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  const sessionId = !(ctx.req.cookies.sessionId ?? "").match(/^[\d]{6,6}$/)
    ? Math.random().toString().slice(2, 10)
    : ctx.req.cookies.sessionId;

  return {
    redirect: {
      statusCode: 302,
      destination: `/${sessionId}`,
    },
  };
}
