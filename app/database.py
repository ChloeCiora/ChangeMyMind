from google.cloud import datastore
import sys
def put_points(user, points):
    add_points = int(points)
    ds = datastore.Client.from_service_account_json("service-acct-keys.json")
    print("datastore is loaded.")
    user_key = ds.key("users", user)
    print("user key is created.")
    entry = ds.get(user_key) #try to get the user_key
    print("got the entry") #doesn't get to this point
    if entry == None: #if not init, then create an entry
        entry = datastore.Entity(key=user_key)
        entry["points"] = add_points
    else:
        entry["points"] += add_points
    ds.put(entry)
if __name__ == "__main__":
    put_points(sys.argv[1], sys.argv[2])