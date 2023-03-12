# from appwrite.client import Client
import json
from discord_webhook import DiscordWebhook, DiscordEmbed

# You can remove imports of services you don't use
# from appwrite.services.account import Account
# from appwrite.services.avatars import Avatars
# from appwrite.services.databases import Databases
# from appwrite.services.functions import Functions
# from appwrite.services.health import Health
# from appwrite.services.locale import Locale
# from appwrite.services.storage import Storage
# from appwrite.services.teams import Teams
# from appwrite.services.users import Users

"""
  'req' variable has:
    'headers' - object with request headers
    'payload' - request body data as a string
    'variables' - object with function variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
"""


def main(req, res):

    eventData = json.loads(req.variables.get("APPWRITE_FUNCTION_EVENT_DATA"))
    user = eventData["user"]
    filename = eventData["name"]
    fileType = eventData["type"]

    message = f"{user} förfrågade {filename} av typen {fileType}"

    embed = DiscordEmbed(
        title=f"{user} förfrågade {filename}", description=eventData['text'])

    webhook = DiscordWebhook(url=req.variables.get(
        "DISCORD_WEBHOOK_URL"))
    webhook.add_embed(embed)
    response = webhook.execute()
    print(response)

    return res.json({
        "message": message,
    })
