import { DocumentReference } from "firebase-admin/firestore";
import { User_Public, User_Private, User_Input } from "@/server/user/user.module";

export function castToUser(document: FirebaseFirestore.DocumentSnapshot): User_Public {
    const id = document.id;
    const data = document.data();
    if (!data) throw new Error("No data found for user: " + id);
    console.log(data);
    return {
        id,
        email: data.email,
        name: data.name,
        address: data.address,
        bio: data.bio,
        joined: new Date(data.joined._seconds * 1000),
        communities: data.communities.map((community: DocumentReference) => community.id),
        last_online: new Date(data.last_online._seconds * 1000),
    };
}

export function castToUsers(documents: FirebaseFirestore.QuerySnapshot): User_Public[] {
    return documents.docs.map((document) => castToUser(document));
}

export function castToProfile(document: FirebaseFirestore.DocumentSnapshot): User_Private {
    const id = document.id;
    const data = document.data();
    if (!data) throw new Error("No data found for user: " + id);

    return {
        id,
        email: data.email,
        name: data.name,
        address: data.address,
        bio: data.bio,
        joined: new Date(data.joined._seconds * 1000),
        communities: data.communities.map((community: DocumentReference) => community.id),
        contacts: data.contacts.map((contact: DocumentReference) => contact.id),
        requests: data.requests.map((request: DocumentReference) => request.id),
        invitations: data.invitations.map((invitation: DocumentReference) => invitation.id),
        last_online: new Date(data.last_online._seconds * 1000),
    };
}

export function castInputToUser(input: User_Input): Omit<User_Private, "id" | "joined" | "last_online"> {
    return {
        email: input.email,
        name: input.name,
        address: input.address || "",
        bio: input.bio || "",
        communities: [],
        contacts: [],
        requests: [],
        invitations: []
    };
}
