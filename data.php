<?php
header('Content-Type: application/json');

// Example data. In a real application, you would fetch this from a database.
$data = [
    'speed-ups' => [
        ['image' => 'speed-up1.jpg', 'name' => 'Speed Up 1', 'price' => 100],
        ['image' => 'speed-up2.jpg', 'name' => 'Speed Up 2', 'price' => 200]
    ],
    'combat' => [
        ['image' => 'combat1.jpg', 'name' => 'Combat 1', 'price' => 300],
        ['image' => 'combat2.jpg', 'name' => 'Combat 2', 'price' => 400]
    ],
    // Add more categories as needed
];

echo json_encode($data);
?>
