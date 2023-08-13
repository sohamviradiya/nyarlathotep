import { Community_Public } from "@/server/community/community.module";
import { List, ListItem, ListItemText } from "@mui/material";
import Link from "next/link";

export default function CommunityList({ communities } : { communities: Community_Public[] } ) {
    return (
        <List >
        {
            communities.map((community) => (
                <ListItem key={community.id}>
                    <Link href={`/community/${community.id}`} style={{ textDecoration: 'none' }}>
                        <ListItemText primary={community.name} />
                    </Link>
                </ListItem>
            ))
        }
        </List >
    );
};

