"use client";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack/Stack';
export default function SkeletonBundle({ size }: { size: number }) {
    const array = Array(size).fill(0);
    return (<Stack spacing={5} direction="column">
        {array.map((element, index) => (<Skeleton variant="rectangular" sx={{backgroundColor: "skyblue"}} width={800} height={100} key={index} />))}
    </Stack>
    )
}