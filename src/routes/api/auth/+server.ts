import type { RequestEvent } from "./$types";
import {prisma} from "../../../lib/prisma";

export async function POST({ request } : RequestEvent)
{
    try {
        const data : any = await request.json();
        console.log(data)
    }
    catch (e:any){
        return new Response("Error")
    }
}