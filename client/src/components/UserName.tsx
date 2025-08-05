import { useQuery } from "@tanstack/react-query";
import { useBulletinApi } from "../bulletin-api";

function UserName() {
    const { get } = useBulletinApi();

    const { data, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await get("/me");
            return res.data?.user;
        },
        retry: false,
    });

    if (isLoading) return <p>Is loading...</p>;

    return (
        <div>
            {
                <p>
                    User's Name:{" "}
                    {data ? data.firstName + " " + data.lastName : "NO NAME"}
                </p>
            }
        </div>
    );
}

export default UserName;
