import React from "react";

const UserProfile = ({ profile }) => {
  return (
    <div>
      <h2>User Profile</h2>
      <p>
        <strong>ZkLogin User Address:</strong> {profile.zkLoginUserAddress}
      </p>
      <p>
        <strong>dWallet Address:</strong> {profile.dWalletAddress}
      </p>
      <p>
        <strong>User Info:</strong>{" "}
        {JSON.stringify(profile.decodedJwt, null, 2)}
      </p>
    </div>
  );
};

export default UserProfile;
