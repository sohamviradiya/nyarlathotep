"use client";
import { Member } from "@/server/community/community.module";
import { User_Public } from "@/server/user/user.module";
import { Stack, Card, CardContent, Typography } from "@mui/material";
import { Link } from "@mui/material";

export default function MemberList({ members }: { members: Member[] }) {
    return (<Stack spacing={2} padding="1rem" direction="row" flexWrap="wrap">
        {members.map((member) => {
            const user = member.user as User_Public;
            return (
                <Card key={user.id}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {user.name}, {member.role.toLocaleLowerCase()}
                        </Typography>
                        <Link href={`/user/${user.id}`} underline="hover" variant="h6">
                            {user.email}
                        </Link>
                        <Typography variant="body1" component="div">
                            Last Seen: {(new Date(user.last_online)).toLocaleString()}
                        </Typography>

                    </CardContent>
                </Card>
            );
        })}
    </Stack>);
} 