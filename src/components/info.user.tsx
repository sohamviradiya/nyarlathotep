import { User_Public } from "@/server/user/user.module";
import CommunityList from "@/components/profile/community-list.profile";
import { Community_Public } from "@/server/community/community.module";
import RequestButton from "@/components/request-button";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function UserInfo({ user }: { user: User_Public }) {
    return (<>
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={6}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h4" component="h2">
                            {user.name}
                        </Typography>
                        <Typography color="h5">
                            {user.email}
                        </Typography>
                        <Typography variant="body2" component="p">
                            {user.bio}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                            {user.address}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Last Online: {(new Date(user.last_online)).toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
                <Box mt={2}>
                    <RequestButton id={user.email} type="CONNECT" />
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" component="h2">
                            Communities:
                        </Typography>
                        <CommunityList communities={user.communities as Community_Public[]} />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </>);
}