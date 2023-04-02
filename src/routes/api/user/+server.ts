import type { RequestEvent } from "./$types";
import {prisma} from "../../../lib/prisma";

export async function POST({ request } : RequestEvent)
{
    try {
        const data : any = await request.json();
        console.log(data)
        const res = await prisma.user.create({data:{
                email: data.email, name: data.name, role: data.role

            }})
        return new Response(JSON.stringify(res));
    }
    catch (e:any){
        return new Response("Error")
    }
}