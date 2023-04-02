import type { RequestEvent } from "./$types";
import {prisma} from "../../../lib/prisma";

export async function POST({ request } : RequestEvent)
{
    try {
        const data : any = await request.json()
        console.log(data)
        const res = await prisma.request.create({data:{
                title: data.title, content: data.content, userId: data.userId

            }})
        return new Response(JSON.stringify(res));
    }
    catch (e: any){
        console.log(e)
        return new Response(e)
    }
}

export async function GET({request}: RequestEvent){
    const requests = await prisma.request.findMany({
        select: {
            title: true,
            content: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
    console.log(requests)
    return new Response(JSON.stringify(requests));
}