"use client";
import { Member } from "@/server/community/community.module";
import { User_Public } from "@/server/user/user.module";
import Stack from "@mui/material/Stack";
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function MemberList({ members }: { members: Member[] }) {
    return (<Stack spacing={2} padding="1rem" direction="row" flexWrap="wrap">
        {members.map((member) => {
            const user = member.user as User_Public;
            return (
                <Card sx={{ maxWidth: 345 }} key={user.id}>
                    <CardActionArea>
                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                {user.name}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {user.email}
                            </Typography>
                            <Typography variant="h6" component="div">
                                Role: {member.role}
                            </Typography>
                            <Typography variant="h6" component="div">
                                Last Online: {(new Date(user.last_online)).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            );
        })}
    </Stack>);
} 