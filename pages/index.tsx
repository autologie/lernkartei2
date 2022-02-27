import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { isValidSessionId } from "../models/String";

export default function Index() {
  return <></>;
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  const sessionId = !isValidSessionId(ctx.req.cookies.sessionId ?? "")
    ? Math.random().toString().slice(2, 10)
    : ctx.req.cookies.sessionId;

  return {
    redirect: {
      statusCode: 302,
      destination: `/${sessionId}`,
    },
  };
}
