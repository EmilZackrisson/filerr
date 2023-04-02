import lucia from "lucia-auth";
import { sveltekit } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import {prisma as prismaClient} from "../prisma"
export const auth = lucia({
    adapter: prisma(prismaClient),
    env: dev ? "DEV" : "PROD",
    middleware: sveltekit()
});

export type Auth = typeof auth;