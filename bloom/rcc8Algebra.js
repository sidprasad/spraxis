export const RCC8_Algebra = {
    "Description": "Region Connection Calculus 8 Algebra", 
    "Name": "RCC8_Algebra",
    "Relations": {
        "DC": {
            "Domain": ["Region"],
            "Converse": "DC", 
            "Name": "Disconnected", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": true, 
            "Transitive": false
        }, 
        "EC": {
            "Domain": ["Region"],
            "Converse": "EC", 
            "Name": "ExternallyConnected", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": true, 
            "Transitive": false
        }, 
        "EQ": {
            "Domain": ["Region"],
            "Converse": "EQ", 
            "Name": "Equal", 
            "Range": ["Region"],
            "Reflexive": true, 
            "Symmetric": true, 
            "Transitive": true
        }, 
        "NTPP": {
            "Domain": ["Region"],
            "Converse": "NTPPI", 
            "Name": "NonTangentialProperPart", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": false, 
            "Transitive": true
        }, 
        "NTPPI": {
            "Domain": ["Region"],
            "Converse": "NTPP", 
            "Name": "NonTangentialProperPartInverse", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": false, 
            "Transitive": true
        }, 
        "PO": {
            "Domain": ["Region"],
            "Converse": "PO", 
            "Name": "PartiallyOverlapping", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": true, 
            "Transitive": false
        }, 
        "TPP": {
            "Domain": ["Region"],
            "Converse": "TPPI", 
            "Name": "TangentialProperPart", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": false, 
            "Transitive": false
        }, 
        "TPPI": {
            "Domain": ["Region"],
            "Converse": "TPP", 
            "Name": "TangentialProperPartInverse", 
            "Range": ["Region"],
            "Reflexive": false, 
            "Symmetric": false, 
            "Transitive": false
        }
    }, 
    "TransTable": {
        "DC": {
            "DC": "DC|EC|EQ|NTPP|NTPPI|PO|TPP|TPPI",
            "EC": "DC|EC|NTPP|PO|TPP",
            "EQ": "DC",
            "NTPP": "DC|EC|NTPP|PO|TPP",
            "NTPPI": "DC",
            "PO": "DC|EC|NTPP|PO|TPP",
            "TPP": "DC|EC|NTPP|PO|TPP",
            "TPPI": "DC"
        },
        "EC": {
            "DC": "DC|EC|NTPPI|PO|TPPI",
            "EC": "DC|EC|EQ|PO|TPP|TPPI",
            "EQ": "EC",
            "NTPP": "NTPP|PO|TPP",
            "NTPPI": "DC",
            "PO": "DC|EC|NTPP|PO|TPP",
            "TPP": "EC|NTPP|PO|TPP",
            "TPPI": "DC|EC"
        },
        "EQ": {
            "DC": "DC",
            "EC": "EC",
            "EQ": "EQ",
            "NTPP": "NTPP",
            "NTPPI": "NTPPI",
            "PO": "PO",
            "TPP": "TPP",
            "TPPI": "TPPI"
        },
        "NTPP": {
            "DC": "DC",
            "EC": "DC",
            "EQ": "NTPP",
            "NTPP": "NTPP",
            "NTPPI": "DC|EC|EQ|NTPP|NTPPI|PO|TPP|TPPI",
            "PO": "DC|EC|NTPP|PO|TPP",
            "TPP": "NTPP",
            "TPPI": "DC|EC|NTPP|PO|TPP"
        },
        "NTPPI": {
            "DC": "DC|EC|NTPPI|PO|TPPI",
            "EC": "NTPPI|PO|TPPI",
            "EQ": "NTPPI",
            "NTPP": "EQ|NTPP|NTPPI|PO|TPP|TPPI",
            "NTPPI": "NTPPI",
            "PO": "NTPPI|PO|TPPI",
            "TPP": "NTPPI|PO|TPPI",
            "TPPI": "NTPPI"
        },
        "PO": {
            "DC": "DC|EC|NTPPI|PO|TPPI",
            "EC": "DC|EC|NTPPI|PO|TPPI",
            "EQ": "PO",
            "NTPP": "NTPP|PO|TPP",
            "NTPPI": "DC|EC|NTPPI|PO|TPPI",
            "PO": "DC|EC|EQ|NTPP|NTPPI|PO|TPP|TPPI",
            "TPP": "NTPP|PO|TPP",
            "TPPI": "DC|EC|NTPPI|PO|TPPI"
        },
        "TPP": {
            "DC": "DC",
            "EC": "DC|EC",
            "EQ": "TPP",
            "NTPP": "NTPP",
            "NTPPI": "DC|EC|NTPPI|PO|TPPI",
            "PO": "DC|EC|NTPP|PO|TPP",
            "TPP": "NTPP|TPP",
            "TPPI": "DC|EC|EQ|PO|TPP|TPPI"
        },
        "TPPI": {
            "DC": "DC|EC|NTPPI|PO|TPPI",
            "EC": "EC|NTPPI|PO|TPPI",
            "EQ": "TPPI",
            "NTPP": "NTPP|PO|TPP",
            "NTPPI": "NTPPI",
            "PO": "NTPPI|PO|TPPI",
            "TPP": "EQ|PO|TPP|TPPI",
            "TPPI": "NTPPI|TPPI"
        }
    }
}