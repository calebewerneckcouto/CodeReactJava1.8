import React from 'react';

const ProfileImage = ({ className = '', size = 'medium' }) => {
  const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMQAAACUCAMAAAD79nauAAAAhFBMVEUUGB8YGygTFxwRFhUAAAAYGyoADAAADgBlUeUJEgASFxpwWf8RFhcFEQAWGSMQFhMNFAhPQbF0XP9hTtsuKWFSQ7ltV/hVRb9aScwjIkkvKmY7MoFCN5FpVO40LW9LPqgbHTI/NYo3MHkfHzwsKFsiIUNHO50nJFEbHDUbGzwQFCgABgD8pO4LAAAEIUlEQVR4nO3ayXLzKBAAYATRgpAEMpLQvlmLZ/z+7zctO/VXquYwU/FBxtVfDtku3YHuBiqEIIQQQgghhBBCCCGEEEIIIYQQQgghhBD6gUp6dggvo+7u2p+Fny7y7Bhe5pczOzuGl911S2zfT3IMpjA8O4oXxVNXq7ODeJG8aV1ZXtjSTYsptLskpLsV5XoshL15qOtQBBlUBFPJ2bH8ElVVWnSzpJJf68rOLCKZlSJoiOJVuzXV2eH8CksafdGzjG+tMU1oZYNibtuJMlO8NsGwcivrOnIgB1NxPgdBm9g57CibYR0eOXQTic4O53dkBTVdc7WXl8GxNAcie1HknPKt6Hp+djC/Fc0imOLQyYXFSchaBD0PRyPExG09h8tKd1NM+CCEXuzsTccLR3PJPQLNqRDpaOvtlI15kHEqc1GI2dalIKrShod810I8z+JW4rXePBLPgdC7tUmQuM5rTjxzScfnuKPUohNUGEaPCymvpzH0TJE9J0UkmbLkRTOMJHWvS3aD6cDdm7yVzbOuZWN0OUsbhgYNb3Wq8/nZVmmomozLiMF3I/GkEcaCQzllbXcx3I+VBIxFTsjc21rt+w2CZ3ctmvc/hai9KArdNnNfg76fm6kd0lKX/WMb8Vbk/tkx/je4T+el1sE3rbUZ2sz1n3//OBWDBUkQFft3Lx6vKxhD7nl+HKvvalZ/Fd1uyfimay05V0qyiEKzUvDV4+fcNcVmw0IAeiuD/eYSBtFHyVjt/bTDmIMjiAla7+zo/qdw7YTO02Hb2m0boEI6ke80GufULJaswzEc+rQMukJAoyq6QJf5MO0kWdo+fv/2+gflfC3nqT00fbaGPocpXnGLUiDHI6yb+PwPdQxpatmbByWzaQiMbeDzcamkJW31J+qkl6A0OZT2kBoYfWlt15O4ijlnZMm7y0VAZQsBn7t8+f7t+x/+IMbY64e2uTJ2y5rhWIPSpO28rM737y14lJVxo4elWh0Kg+5xeK3W60ikYs8VYH7WvnuHityyKK5fXqyiRztiB7jjURoyxWP/y9nKlb35dZvXAvZ/OcwVdCbvB87cZd7KwPRXHmdvnkVUTSmcMY6C7uAUXh500HVQ31259de//XtdVm9eFjSScIV2rpW8bdBaDyZPt6mHKvHu9zgzhbbhCQoKgI31yu9fP9zDah7K4tKlK7flRZNeG7iQfgu6x6TQ+bYo37clBRA96zqWyTg6jMNOOu53lr7wUyiSyLL/60AIIYQQQgihN+eAJLHrsfdf3G+Wp5E4jyycs+N4UfIRWRDXOT7OjuJFifpo8LPDeNFRGI7tS/FotdYvBaRgfZ8lj+1kexLJsRS2J/EJNZF8TBKW5/BBu+nsKF7zCZvpE6r6E3L4hM2UJNan8BE5kA9IAZKwPwWEEHpT/wCTLUnlsiCetgAAAABJRU5ErkJggg==";

  const sizeClasses = {
    small: 'profile-img-small',
    medium: 'profile-img-medium',
    large: 'profile-img-large'
  };

  return (
    <div className={`profile-img ${sizeClasses[size]} ${className}`}>
      <img src={base64Image} alt="Perfil" />
    </div>
  );
};

export default ProfileImage;